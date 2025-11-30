import React, { useState, useEffect } from "react";
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

axios.defaults.withCredentials = true;

export default function DeltaVisionAssetClassChart() {
  const [selectedView, setSelectedView] = useState("Total Group");
  const [selectedPeriodType, setSelectedPeriodType] = useState("Yearly");
  const [selectedValueType, setSelectedValueType] = useState("Abs");
  const [chartData, setChartData] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [categoryOrder, setCategoryOrder] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const clientId = localStorage.getItem("client");

  const viewByOptions = ["Total Group", "Entity", "Asset Class", "Sub-Asset Class"];
  const periodOptions = ["Monthly", "Yearly"];
  const valueTypeOptions = ["Abs", "Percentage"];

  // Color palette for different categories
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Detect theme changes
  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  // Function to convert absolute values to percentages
  const convertToPercentage = (data, categories) => {
    // For Total Group, calculate percentage across all years/months
    if (selectedView === "Total Group") {
      // Calculate grand total across all periods
      let grandTotal = 0;
      data.forEach(item => {
        categories.forEach(cat => {
          if (item[cat]) {
            grandTotal += item[cat];
          }
        });
      });
      
      // Convert each period to percentage of grand total
      return data.map(item => {
        const newItem = { name: item.name, month: item.month, year: item.year };
        
        if (grandTotal > 0) {
          categories.forEach(cat => {
            if (item[cat]) {
              newItem[cat] = (item[cat] / grandTotal) * 100;
            }
          });
        }
        
        return newItem;
      });
    }
    
    // For other views, calculate percentage within each period
    return data.map(item => {
      const newItem = { name: item.name, month: item.month, year: item.year };
      
      // Calculate total for this period
      let total = 0;
      categories.forEach(cat => {
        if (item[cat]) {
          total += item[cat];
        }
      });
      
      // Convert each category to percentage
      if (total > 0) {
        categories.forEach(cat => {
          if (item[cat]) {
            newItem[cat] = (item[cat] / total) * 100;
          }
        });
      }
      
      return newItem;
    });
  };

  useEffect(() => {
    let apiUrl = "";

    // ---------------- API Selection Logic -----------------
    if (selectedView === "Total Group") {
      apiUrl =
        selectedPeriodType === "Yearly"
          ? `https://optimizalphabackend.onrender.com/api/avg-market-values/${clientId}`
          : `https://optimizalphabackend.onrender.com/api/compare-monthly/${clientId}`;
    }
    else if (selectedView === "Entity") {
      apiUrl =
        selectedPeriodType === "Yearly"
          ? `https://optimizalphabackend.onrender.com/api/avg-entity-values/${clientId}`
          : `https://optimizalphabackend.onrender.com/api/entity-monthly/${clientId}`;
    }
    else if (selectedView === "Asset Class") {
      apiUrl =
        selectedPeriodType === "Yearly"
          ? `https://optimizalphabackend.onrender.com/api/avg-assetclass-yearly/${clientId}`
          : `https://optimizalphabackend.onrender.com/api/avg-assetclass-monthly/${clientId}`;
    }
    else if (selectedView === "Sub-Asset Class") {
      apiUrl =
        selectedPeriodType === "Yearly"
          ? `https://optimizalphabackend.onrender.com/api/avg-assetclass2-yearly/${clientId}`
          : `https://optimizalphabackend.onrender.com/api/avg-assetclass2-monthly/${clientId}`;
    }

    if (!apiUrl) return;

    axios.get(apiUrl).then(res => {
      console.log("API URL:", apiUrl);
      console.log("API Response:", res.data);
      
      const dataArray = res.data?.data || res.data?.result || res.data;
      
      if (!dataArray || (Array.isArray(dataArray) && dataArray.length === 0)) {
        console.log("No data available");
        setChartData([]);
        setAvailableYears([]);
        setCategoryOrder([]);
        return;
      }

      let formatted = [];
      let years = new Set();
      let categories = [];
      const seenCategories = new Set();

      // -------- YEARLY (Single Bar for total group) --------
      if (selectedView === "Total Group" && selectedPeriodType === "Yearly") {
        formatted = dataArray.map(item => {
          years.add(String(item.year));
          return {
            name: String(item.year),
            "Total Group": Number(item.avg),
          };
        });
        categories = ["Total Group"];
      }

      // -------- YEARLY (Entity or Asset Class - Grouped by Year) --------
      else if (
        (selectedView === "Entity" || selectedView === "Asset Class" || selectedView === "Sub-Asset Class") &&
        selectedPeriodType === "Yearly"
      ) {
        const grouped = {};
        
        // First pass: collect categories in order they appear in API response
        dataArray.forEach(row => {
          let key;
          if (selectedView === "Entity") {
            key = row.entity;
          } else if (selectedView === "Asset Class") {
            key = row.asset_class;
          } else if (selectedView === "Sub-Asset Class") {
            key = row.asset_class || row.sub_asset_class || row.asset_class2;
          }
          
          if (!seenCategories.has(key)) {
            categories.push(key);
            seenCategories.add(key);
          }
          
          const yearStr = String(row.year);
          years.add(yearStr);
          
          if (!grouped[yearStr]) grouped[yearStr] = { name: yearStr };
          grouped[yearStr][key] = Number(row.avg);
        });
        formatted = Object.values(grouped);
      }

      // -------- MONTHLY (Latest Month First) --------
      else if (selectedPeriodType === "Monthly") {
        const grouped = {};
        
        // First, extract category order from the first occurrence of each category
        dataArray.forEach(row => {
          let category;
          if (selectedView === "Total Group") {
            category = "Total Group";
          } else if (selectedView === "Entity") {
            category = row.entity;
          } else if (selectedView === "Asset Class") {
            category = row.asset_class;
          } else if (selectedView === "Sub-Asset Class") {
            category = row.asset_class || row.sub_asset_class || row.asset_class2;
          }

          if (!seenCategories.has(category)) {
            categories.push(category);
            seenCategories.add(category);
          }
        });

        // Now group by month-year
        dataArray.forEach(row => {
          years.add(String(row.year));
          
          let category;
          if (selectedView === "Total Group") {
            category = "Total Group";
          } else if (selectedView === "Entity") {
            category = row.entity;
          } else if (selectedView === "Asset Class") {
            category = row.asset_class;
          } else if (selectedView === "Sub-Asset Class") {
            category = row.asset_class || row.sub_asset_class || row.asset_class2;
          }

          const monthYear = `${row.month} ${row.year}`;
          if (!grouped[monthYear]) {
            grouped[monthYear] = { 
              name: monthYear, 
              month: row.month, 
              year: row.year 
            };
          }
          grouped[monthYear][category] = Number(row.avg);
        });

        formatted = Object.values(grouped);
        
        // Sort by year and month (latest first)
        const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        formatted.sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
        });
      }

      console.log("Formatted Data:", formatted);
      console.log("Category Order:", categories);
      
      setCategoryOrder(categories);
      
      // Convert to percentage if needed
      if (selectedValueType === "Percentage") {
        formatted = convertToPercentage(formatted, categories);
      }
      
      setChartData(formatted);
      setAvailableYears(Array.from(years).sort());
    })
    .catch(err => {
      console.error("API Error:", err);
      setChartData([]);
      setAvailableYears([]);
      setCategoryOrder([]);
    });
  }, [selectedPeriodType, selectedView, selectedValueType]);

  // Responsive values based on screen size
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;
  
  const getResponsiveValue = (mobile, tablet, desktop) => {
    if (isMobile) return mobile;
    if (isTablet) return tablet;
    return desktop;
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-xl border-2 border-gray-200 dark:border-gray-700 max-w-xs">
          <p className="font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 text-sm sm:text-base">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs sm:text-base flex items-center gap-2 mb-1">
              <span 
                className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="font-medium text-gray-600 dark:text-gray-300 truncate">{entry.name}:</span>
              <span className="font-bold whitespace-nowrap" style={{ color: entry.color }}>
                {selectedValueType === "Percentage"
                  ? `${Number(entry.value).toFixed(2)}%`
                  : `₹${Number(entry.value).toLocaleString('en-IN')}`
                }
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Dynamic colors based on theme
  const axisColor = isDarkMode ? '#ffffff' : '#374151';
  const gridColor = isDarkMode ? '#374151' : '#e5e7eb';
  const labelColor = isDarkMode ? '#ffffff' : '#1f2937';

  // Calculate bar sizes based on view and screen size
  const getBarSize = () => {
    const baseSizes = {
      totalGroupYearly: getResponsiveValue(60, 80, 100),
      totalGroupMonthly: getResponsiveValue(40, 55, 70),
      otherYearly: getResponsiveValue(40, 55, 70),
      otherMonthly: getResponsiveValue(30, 45, 55),
    };

    if (selectedView === "Total Group" && selectedPeriodType === "Yearly") {
      return baseSizes.totalGroupYearly;
    } else if (selectedView === "Total Group" && selectedPeriodType === "Monthly") {
      return baseSizes.totalGroupMonthly;
    } else if (selectedPeriodType === "Yearly") {
      return baseSizes.otherYearly;
    } else {
      return baseSizes.otherMonthly;
    }
  };

  return (
    <div className="bg-white dark:bg-[#141414] rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 lg:p-8 mb-8 mt-6 sm:mt-8 lg:mt-10 shadow-lg">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 lg:gap-6 mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
          Exposure Trend
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-4 lg:gap-6 flex-wrap">
          {/* View By Selector */}
          <div className="flex items-center gap-2 sm:gap-3">
            <label className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">
              View By:
            </label>
            <select
              value={selectedView}
              onChange={(e) => setSelectedView(e.target.value)}
              className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 w-full sm:w-44 dark:bg-[#1f1f1f] dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {viewByOptions.map((view) => (
                <option key={view}>{view}</option>
              ))}
            </select>
          </div>

          {/* Period Toggle */}
          <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-[#1f1f1f] p-1">
            {periodOptions.map((option) => (
              <button
                key={option}
                onClick={() => setSelectedPeriodType(option)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap ${
                  selectedPeriodType === option
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Value Type Toggle */}
          <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-[#1f1f1f] p-1">
            {valueTypeOptions.map((option) => (
              <button
                key={option}
                onClick={() => setSelectedValueType(option)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap ${
                  selectedValueType === option
                    ? 'bg-green-500 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-[400px] sm:h-[500px] lg:h-[600px] bg-gray-50 dark:bg-[#0a0a0a] rounded-lg p-3 sm:p-4 lg:p-6">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 dark:text-gray-600 text-center font-medium text-base sm:text-lg">
              No data available
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData}
              margin={{ 
                top: getResponsiveValue(20, 25, 30), 
                right: getResponsiveValue(10, 20, 40), 
                left: getResponsiveValue(0, 15, 20), 
                bottom: getResponsiveValue(60, 70, 80)
              }}
              barGap={10}
              barCategoryGap={getResponsiveValue("15%", "20%", "25%")}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={gridColor}
                vertical={false}
              />
              
              <XAxis 
                dataKey="name"
                tick={{ 
                  fill: axisColor, 
                  fontSize: getResponsiveValue(10, 12, 15), 
                  fontWeight: 600 
                }}
                tickLine={false}
                axisLine={{ stroke: axisColor, strokeWidth: 2 }}
                angle={getResponsiveValue(-45, 0, 0)}
                textAnchor={getResponsiveValue("end", "middle", "middle")}
                height={getResponsiveValue(80, 60, 60)}
                interval={0}
              />
              
              <YAxis 
                label={{ 
                  value: selectedValueType === "Percentage" ? 'Percentage (%)' : 'Abs (₹)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { 
                    fill: labelColor, 
                    fontSize: getResponsiveValue(12, 14, 16), 
                    fontWeight: 700 
                  }
                }}
                tickFormatter={(v) => {
                  if (selectedValueType === "Percentage") {
                    return `${v.toFixed(0)}%`;
                  }
                  if (v >= 10000000) return `${(v/10000000).toFixed(1)}Cr`;
                  if (v >= 100000) return `${(v/100000).toFixed(1)}L`;
                  if (v >= 1000) return `${(v/1000).toFixed(0)}K`;
                  return `${v}`;
                }}
                tick={{ 
                  fill: axisColor, 
                  fontSize: getResponsiveValue(10, 12, 15), 
                  fontWeight: 600 
                }}
                tickLine={false}
                axisLine={{ stroke: axisColor, strokeWidth: 2 }}
                width={getResponsiveValue(60, 75, 90)}
                tickCount={8}
                domain={[0, 'auto']}
              />
              
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
              
              <Legend
                content={() => (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: getResponsiveValue("8px", "10px", "10px"),
                      alignItems: "center",
                      paddingTop: getResponsiveValue("10px", "15px", "20px"),
                      flexWrap: "wrap",
                      fontSize: getResponsiveValue("12px", "14px", "15px"),
                    }}
                  >
                    {categoryOrder.map((cat, index) => (
                      <div
                        key={cat}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          fontWeight: "600",
                          cursor: "default",
                          color: isDarkMode ? "#fff" : "#1f2937",
                        }}
                      >
                        <span
                          style={{
                            width: getResponsiveValue("12px", "14px", "16px"),
                            height: getResponsiveValue("12px", "14px", "16px"),
                            backgroundColor: colors[index % colors.length],
                            borderRadius: "4px",
                            display: "inline-block",
                            flexShrink: 0,
                          }}
                        />
                        <span className="truncate max-w-[120px] sm:max-w-none">{cat}</span>
                      </div>
                    ))}
                  </div>
                )}
              />

              {/* Bars in the correct order */}
              {categoryOrder.map((category, index) => (
                <Bar 
                  key={category}
                  dataKey={category} 
                  fill={colors[index % colors.length]} 
                  barSize={getBarSize()}
                  radius={[10, 10, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}